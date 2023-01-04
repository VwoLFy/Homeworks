import {UsersRepository} from "../../users/infrastructure/users-repository";
import {CommentsRepository} from "../infrastructure/comments-repository";
import {
    UpdateCommentDto
} from "./dto/UpdateCommentDto";
import {inject, injectable} from "inversify";
import {Comment, CommentModel, LikesInfo} from "../domain/comment.schema";
import {LikeStatus} from "../../main/types/enums";
import {Like, LikeDocument, LikeModel} from "../domain/like.schema";
import {CreateCommentDto} from "./dto/CreateCommentDto";
import {LikeCommentDto} from "./dto/LikeCommentDto";
import {PostsRepository} from "../../posts/infrastructure/posts-repository";

@injectable()
export class CommentsService {
    constructor(@inject(UsersRepository) protected usersRepository: UsersRepository,
                @inject(PostsRepository) protected postsRepository: PostsRepository,
                @inject(CommentsRepository) protected commentsRepository: CommentsRepository) {}

    async createComment(dto: CreateCommentDto): Promise<string | null> {
        const {postId, content, userId} = dto
        const isPostExist = await this.postsRepository.findPostById(postId)
        const userLogin = await this.usersRepository.findUserLoginById(userId)
        if (!isPostExist || !userLogin) return null

        const likesInfo = new LikesInfo()
        const newComment = new Comment(
            content,
            userId,
            userLogin,
            postId,
            likesInfo
        )
        const comment = new CommentModel(newComment)
        await this.commentsRepository.saveComment(comment)
        return comment.id
    }
    async updateComment(dto: UpdateCommentDto): Promise<number | null> {
        const {commentId, content, userId} = dto
        const foundComment = await this.commentsRepository.findComment(commentId)
        if (!foundComment) {
            return 404
        } else if (foundComment.userId !== userId) {
            return 403
        }

        foundComment.updateComment(content)
        await this.commentsRepository.saveComment(foundComment)
        return 204
    }
    async likeComment(dto: LikeCommentDto): Promise<boolean> {
        const {commentId, userId, likeStatus} = dto
        const foundComment = await this.commentsRepository.findComment(commentId)
        if (!foundComment) return false

        let oldLikeStatus: LikeStatus
        let like: LikeDocument
        const foundLike = await this.commentsRepository.findLikeStatus(commentId, userId)

        if (foundLike) {
            oldLikeStatus = foundLike.likeStatus
            like = foundLike
            like.updateLikeStatus(likeStatus)
        } else {
            oldLikeStatus = LikeStatus.None
            const newLike = new Like(commentId, userId, likeStatus)
            like = new LikeModel(newLike)
        }

        foundComment.updateLikesCount(likeStatus, oldLikeStatus)
        await this.commentsRepository.saveComment(foundComment)

        if (likeStatus === LikeStatus.None) {
            await this.commentsRepository.deleteLike(like._id)
        } else {
            await this.commentsRepository.saveLike(like)
        }
        return true
    }
    async deleteComment(commentId: string, userId: string): Promise<number | null> {
        const foundComment = await this.commentsRepository.findComment(commentId)
        if (!foundComment) {
            return 404
        } else if (foundComment.userId !== userId) {
            return 403
        }
        return await this.commentsRepository.deleteComment(foundComment._id)
    }
    async deleteAll() {
        await this.commentsRepository.deleteAll()
    }
}
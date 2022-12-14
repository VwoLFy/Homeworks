import {CommentsQueryRepo} from "../infrastructure/comments-queryRepo";
import {CommentsService} from "../application/comments-service";
import {RequestWithParam, RequestWithParamAndBody} from "../../main/types/types";
import {Response} from "express";
import {CommentViewModel} from "./models/CommentViewModel";
import {HTTP_Status} from "../../main/types/enums";
import {CommentInputModel} from "./models/CommentInputModel";
import {CommentLikeInputModel} from "./models/CommentLikeInputModel";
import {inject, injectable} from "inversify";

@injectable()
export class CommentsController {
    constructor(@inject(CommentsQueryRepo) protected commentsQueryRepo: CommentsQueryRepo,
                @inject(CommentsService) protected commentsService: CommentsService) { }

    async getComment(req: RequestWithParam, res: Response<CommentViewModel>) {
        const userId = req.userId ? req.userId : null
        const foundComment = await this.commentsQueryRepo.findCommentById(req.params.id, userId);
        if (!foundComment) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.status(HTTP_Status.OK_200).json(foundComment)
        }
    }

    async updateComment(req: RequestWithParamAndBody<CommentInputModel>, res: Response) {
        const updateStatus = await this.commentsService.updateComment({
            commentId: req.params.id,
            content: req.body.content,
            userId: req.userId})
        if (!updateStatus) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(updateStatus as HTTP_Status)
        }
    }

    async likeComment(req: RequestWithParamAndBody<CommentLikeInputModel>, res: Response) {
        const result = await this.commentsService.likeComment({
            commentId: req.params.id,
            userId: req.userId,
            likeStatus: req.body.likeStatus})
        if (!result) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(HTTP_Status.NO_CONTENT_204)
        }
    }

    async deleteComment(req: RequestWithParam, res: Response) {
        const deleteStatus = await this.commentsService.deleteComment(req.params.id, req.userId)
        if (!deleteStatus) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(deleteStatus as HTTP_Status)
        }
    }
}
import {BlogsQueryRepo} from "../infrastructure/blogs-queryRepo";
import {BlogsService} from "../application/blogs-service";
import {PostsQueryRepo} from "../../posts/infrastructure/posts-queryRepo";
import {PostsService} from "../../posts/application/posts-service";
import {
    RequestWithBody,
    RequestWithParam,
    RequestWithParamAndBody,
    RequestWithParamAndQuery,
    RequestWithQuery
} from "../../main/types/types";
import {FindBlogsQueryModel} from "./models/FindBlogsQueryModel";
import {Response} from "express";
import {BlogsViewModelPage} from "./models/BlogsViewModelPage";
import {BlogViewModel} from "./models/BlogViewModel";
import {HTTP_Status} from "../../main/types/enums";
import {PostsViewModelPage} from "../../posts/api/models/PostsViewModelPage";
import {BlogPostInputModel} from "./models/BlogPostInputModel";
import {PostViewModel} from "../../posts/api/models/PostViewModel";
import {inject, injectable} from "inversify";
import {CreateBlogDto} from "../application/dto/CreateBlogDto";
import {UpdateBlogDto} from "../application/dto/UpdateBlogDto";
import {FindPostsQueryModel} from "../../posts/api/models/FindPostsQueryModel";

@injectable()
export class BlogsController {
    constructor(@inject(BlogsQueryRepo) protected blogsQueryRepo: BlogsQueryRepo,
                @inject(BlogsService) protected blogsService: BlogsService,
                @inject(PostsQueryRepo) protected postsQueryRepo: PostsQueryRepo,
                @inject(PostsService) protected postsService: PostsService) {
    }

    async getBlogs(req: RequestWithQuery<FindBlogsQueryModel>, res: Response<BlogsViewModelPage>) {
        res.json(await this.blogsQueryRepo.findBlogs({
            searchNameTerm: req.query.searchNameTerm,
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection
        }))
    }

    async getBlog(req: RequestWithParam, res: Response<BlogViewModel>) {
        const foundBlog = await this.blogsQueryRepo.findBlogById(req.params.id);
        if (!foundBlog) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.status(HTTP_Status.OK_200).json(foundBlog)
        }
    }

    async createBlog(req: RequestWithBody<CreateBlogDto>, res: Response<BlogViewModel>) {
        const createdBlogId = await this.blogsService.createBlog({
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        });
        const createdBlog = await this.blogsQueryRepo.findBlogById(createdBlogId);
        if (createdBlog) res.status(HTTP_Status.CREATED_201).json(createdBlog)
    }

    async updateBlog(req: RequestWithParamAndBody<UpdateBlogDto>, res: Response) {
        const isUpdatedBlog = await this.blogsService.updateBlog(req.params.id, {
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        });
        if (!isUpdatedBlog) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(HTTP_Status.NO_CONTENT_204)
        }
    }

    async getPostsForBlog(req: RequestWithParamAndQuery<FindPostsQueryModel>, res: Response<PostsViewModelPage>) {
        const userId = req.userId ? req.userId : null
        const foundBlog = await this.postsQueryRepo.findPostsByBlogId(req.params.id, userId, {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection
        })
        if (!foundBlog) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.status(HTTP_Status.OK_200).json(foundBlog)
        }
    }

    async createPostForBlog(req: RequestWithParamAndBody<BlogPostInputModel>, res: Response<PostViewModel>) {
        const userId = req.userId ? req.userId : null
        const createdPostId = await this.postsService.createPost({
            title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: req.params.id
        })
        if (!createdPostId) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            const createdPost = await this.postsQueryRepo.findPostById(createdPostId, userId)
            if (createdPost) res.status(HTTP_Status.CREATED_201).json(createdPost)
        }
    }

    async deleteBlog(req: RequestWithParam, res: Response) {
        const isDeletedBlog = await this.blogsService.deleteBlog(req.params.id);
        if (!isDeletedBlog) {
            res.sendStatus(HTTP_Status.NOT_FOUND_404)
        } else {
            res.sendStatus(HTTP_Status.NO_CONTENT_204)
        }
    }
}
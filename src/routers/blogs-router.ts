import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogCreateValidation, blogPostCreateValidation} from "../middlewares/validators/blogs";
import {validateRequest} from "../middlewares/validators/validateRequest";
import {basic} from "../middlewares/auth";

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
    const {
        searchNameTerm = null,
        sortBy = 'createdAt',
        sortDirection = 'desc',
        pageNumber = 1,
        pageSize = 10,
    } = req.query

    const query = {
        searchNameTerm: searchNameTerm?.toString(),
        sortBy: sortBy.toString(),
        sortDirection: sortDirection.toString(),
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize)
    }
    const blogs = await blogsRepository.findAllBlogs(query);
    return res.status(200).send(blogs);
})

blogsRouter.get('/:id', async (req: Request, res: Response) => {
    const blog = await blogsRepository.findOneBlog(req.params.id);
    if (!blog) res.sendStatus(404);
    res.status(200).json(blog);
})


blogsRouter.get('/:id/posts', async (req: Request, res: Response) => {
    const {
        pageNumber = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortDirection = 'desc',
    } = req.query;

    const query = {
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        blogId: req.params.id
    }

    const blog = await blogsRepository.findOneBlog(req.params.id);
    if (!blog) {
        return res.sendStatus(404);
    }

    const blogs = await blogsRepository.findAllBlogPosts(query)
    return res.status(200).send(blogs);
})

blogsRouter.put('/:id', basic, blogCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const ok = await blogsRepository.update(req.params.id, req.body);
    if (!ok) res.sendStatus(404);
    res.sendStatus(204);
})

blogsRouter.post('/', basic, blogCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const created = await blogsRepository.createBlog(req.body);
    res.status(201).json(created)
})

blogsRouter.post('/:id/posts', basic, blogPostCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const created = await blogsRepository.createBlogPost(req.params.id, {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
    });
    if (!created) {
        return res.sendStatus(404);
    }
    return res.status(201).json(created);
})

blogsRouter.delete('/:id', basic, async (req: Request, res: Response) => {
    const ok = await blogsRepository.deleteBLog(req.params.id);
    if (!ok) res.sendStatus(404);
    res.sendStatus(204);
})

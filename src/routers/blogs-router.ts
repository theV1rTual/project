import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {blogCreateValidation} from "../middlewares/validators/blogs";
import {validateRequest} from "../middlewares/validators/validateRequest";
import {basic} from "../middlewares/auth";

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
    const blogs = await blogsRepository.findAllBlogs();
    return res.status(200).send(blogs);
})

blogsRouter.get('/:id', async (req: Request, res: Response) => {
    const blog = await blogsRepository.findOneBlog(req.params.id);
    if (!blog) res.sendStatus(404);
    res.status(200).json(blog);
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

blogsRouter.delete('/:id', basic, async (req: Request, res: Response) => {
    const ok = await blogsRepository.deleteBLog(req.params.id);
    if (!ok) res.sendStatus(404);
    res.sendStatus(204);
})

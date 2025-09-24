import {Router, Request, Response} from "express";
import {blogsRepository} from "../repositories/blogs-repository";

export const blogsRouter = Router({})

blogsRouter.get('/', async (req: Request, res: Response) => {
    const blogs = await blogsRepository.getBlogs();
    res.send(blogs);
})

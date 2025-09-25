import {Router, Request, Response} from "express";
import {postsRepository} from "../repositories/posts-repository";
import {basic} from "../middlewares/validators/auth";
import {blogsRepository} from "../repositories/blogs-repository";
import {postCreateValidation} from "../middlewares/validators/posts";
import {validateRequest} from "../middlewares/validators/validateRequest";

export const postsRouter = Router({})

postsRouter.get('/', async (req: Request, res: Response) => {
    const posts = await postsRepository.findAllPosts();
    res.status(200).json(posts);
})

postsRouter.get('/:id', async (req: Request,  res: Response) => {
    const post = await postsRepository.findOnePost(req.params.id);
    if (!post) res.sendStatus(404);
    res.status(200).json(post)
})

postsRouter.put('/:id', basic, postCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const ok = await postsRepository.update(req.params.id, req.body);
    if (!ok) res.sendStatus(404);
    res.sendStatus(204);
})

postsRouter.post('/', basic, postCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const created = await postsRepository.createPost(req.body);
    res.status(201).json(created)
})

postsRouter.delete('/:id', basic, async (req: Request, res: Response) => {
    const ok = await postsRepository.deletePost(req.params.id);
    if (!ok) res.sendStatus(404)
    res.sendStatus(204);
})


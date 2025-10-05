import {Router, Request, Response} from "express";
import {usersRepository} from "../repositories/users-repository";
import {validateRequest} from "../middlewares/validators/validateRequest";
import {basic} from "../middlewares/auth";
import {userCreateValidation} from "../middlewares/validators/users";
import {UsersService} from "../bll/users-service";

export const usersRouter = Router({})

usersRouter.get('/', basic, async (req: Request, res: Response) => {
    const {
        sortBy = 'createdBy',
        sortDirection = 'desc',
        pageNumber = 1,
        pageSize = 10,
        searchLoginTerm = null,
        searchEmailTerm = null
    } = req.query

    const query = {
        pageNumber: Number(pageNumber),
        pageSize: Number(pageSize),
        sortBy: sortBy.toString(),
        sortDirection: sortDirection.toString(),
        searchLoginTerm: searchLoginTerm ? searchLoginTerm.toString() : '',
        searchEmailTerm: searchEmailTerm? searchEmailTerm.toString() : '',
    }

    const users = await usersRepository.findAllUsers(query)
    res.status(200).json(users)
})

usersRouter.post('/', basic, userCreateValidation, validateRequest, async (req: Request, res: Response) => {
    const user = await UsersService.createUser({
        login: req.body.login,
        password: req.body.password,
        email: req.body.email
    })

    if (!user) {
        return res.status(400).json({
            errorsMessages: [{ field: 'login', message: 'login should be unique' }],
        })
    }

    return res.status(201).send(user)
})

usersRouter.delete('/:id', basic, async (req: Request, res: Response) => {
    const ok = await usersRepository.deleteUser(req.params.id);
    if (!ok) return res.sendStatus(404)
    return res.sendStatus(204)
})

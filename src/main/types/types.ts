import {Request} from "express";

type URIParamsModel = {
    id: string
}

export type RequestWithParam = Request<URIParamsModel>
export type RequestWithBody<B> = Request<{}, {}, B>
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>
export type RequestWithParamAndBody<B> = Request<URIParamsModel, {}, B>
export type RequestWithParamAndQuery<Q> = Request<URIParamsModel, {}, {}, Q>
//export type RequestWithParamAndBodyAndQuery<P, B, Q> = Request<P, {}, B, Q>

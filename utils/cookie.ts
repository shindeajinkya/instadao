import { serialize, parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export const TOKEN_NAME = "signature";
export const ACCOUNT = "account";
export const API_KEY_TOKEN_NAME = "apiKey";
const MAX_AGE = 60 * 60 * 8;

export const removeAuthCookies = (res: NextApiResponse) => {
	const expireConfig = {
		maxAge: 0,
		expires: new Date("12/12/2120"),
	};

	res.setHeader("Set-Cookie", [
		createCookie(TOKEN_NAME, "", expireConfig),
		createCookie("authed", "", expireConfig),
	]);
};

export const createCookie = (name: string, data: any, options = {}) => {
	return serialize(name, data, {
		expires: new Date("12/12/2120"),
		secure: process.env.NODE_ENV === "production",
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		...options,
	});
};

export interface ICookie {
	name: string;
	value: string;
}

export const setTokenCookie = (res: NextApiResponse, cookies: ICookie[]) => {
	res.setHeader("Set-Cookie", [
		...cookies.map((cookie) =>
			createCookie(cookie.name, cookie.value, {
				maxAge: MAX_AGE,
			})
		),
		createCookie("authed", true, { httpOnly: false }),
	]);
};

export const getDataFromCookie = (req: any, tokenName: string) => {
	return req.cookies[tokenName];
};
export const getAuthToken = (req: any) => {
	return req.cookies[TOKEN_NAME];
};

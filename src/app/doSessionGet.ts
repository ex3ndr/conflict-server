import { db } from "./db";
import { sessionConvert } from "./sessionConvert";

export async function doSessionGet(id: string, token: string) {
    let res = await db.session.findFirst({ where: { uid: id } });
    return sessionConvert(res, token);
}
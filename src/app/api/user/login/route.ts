import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export async function POST(req: NextRequest, _res: NextResponse) {
    try {
        const data = await req.json();
        const { useremail, userpassword } = data;
        console.log(data);
        const user = await prisma.user.findUnique({ where: { useremail: useremail } });
        if (!user) {
            //return NextResponse.json({ message: "User not found" }, { status: 400 } as any);
            return createResponse("User not found", 400);
        }
        const passwordMatch = await bcrypt.compare(userpassword, user.userpassword);
        if (!passwordMatch) {
            return createResponse("Invalid password", 400);
        }

        const tokendata = { userId: user.id, email: user.useremail };
        const token = jwt.sign(tokendata, process.env.TOKEN_SECRET || "secret", { expiresIn: "1h", });

        const response = NextResponse.json({ message: "User logged in successfully", user: user, token: token }, { status: 200 } as any);
        response.cookies.set("token", token, { httpOnly: true, secure: true });
        return response;
    }
    catch (error) {
        console.log(error);
        return createResponse("Something went wrong", 500);
    }

}
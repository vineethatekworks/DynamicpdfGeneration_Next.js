import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";


export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const data = await req.json();
        const { username, useremail, userpassword } = data;

        const userExists = await prisma.user.findUnique({ where: { useremail: useremail } });
        if (userExists) {
            return createResponse("User already exists", 400);
        }

        //hash password
        const hashedPassword = await bcrypt.hash(userpassword, 10);

        //create user
        const newUser = await prisma.user.create({
            data: {
                username,
                useremail,
                userpassword: hashedPassword
            }
        });
        return createResponse("User registered successfully", 200);
    }
    catch (error) {
        console.log(error);
        return createResponse("Something went wrong", 500);
    }
}
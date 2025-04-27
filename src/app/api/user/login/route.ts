import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates a user using email and password, and returns a JWT token if successful.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               useremail:
 *                 type: string
 *                 format: email
 *               userpassword:
 *                 type: string
 *                 format: password
 *             required:
 *               - useremail
 *               - userpassword
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     useremail:
 *                       type: string
 *                     (other user fields if you want)
 *                 token:
 *                   type: string
 *       400:
 *         description: User not found or Invalid password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

export async function POST(req: NextRequest, _res: NextResponse) {
    try {
        const data = await req.json();
        const { useremail, userpassword } = data;

        const user = await prisma.user.findUnique({ where: { useremail: useremail } });
        if (!user) {
            return createResponse("User not found", 400);
        }

        const passwordMatch = await bcrypt.compare(userpassword, user.userpassword);
        if (!passwordMatch) {
            return createResponse("Invalid password", 400);
        }

        const tokendata = { userId: user.id, email: user.useremail };
        const token = jwt.sign(tokendata, process.env.TOKEN_SECRET || "secret", { expiresIn: "1h" });

        const response = NextResponse.json({ message: "User logged in successfully", user: user, token: token }, { status: 200 } as any);
        response.cookies.set("token", token, { httpOnly: true, secure: true });
        return response;
    }
    catch (error) {
        console.log(error);
        return createResponse("Something went wrong", 500);
    }
}

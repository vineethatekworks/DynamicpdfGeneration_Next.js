import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: User Registration
 *     description: Registers a new user by creating an account with username, email, and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               useremail:
 *                 type: string
 *                 format: email
 *               userpassword:
 *                 type: string
 *                 format: password
 *             required:
 *               - username
 *               - useremail
 *               - userpassword
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User already exists
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

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const data = await req.json();
        const { username, useremail, userpassword } = data;

        const userExists = await prisma.user.findUnique({ where: { useremail: useremail } });
        if (userExists) {
            return createResponse("User already exists", 400);
        }

        const hashedPassword = await bcrypt.hash(userpassword, 10);

         await prisma.user.create({
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

// deno-lint-ignore-file

import { NextResponse } from "next/server";

export function createResponse(message: string, status: number, data?: any): NextResponse {
  const response = data ? { message, status, data } : { message, status };
  return NextResponse.json(response, { status } as any);
}

 
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            {success:true,message:"Logged out successfully"},
            {status:200},
        );

        response.cookies.set("sb-access-token","",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            path : "/",
            maxAge:0,
        });


        response.cookies.set("sb-refresh-token","",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            path :"/",
            maxAge:0,
        })

        return response;
    } catch  {
        return NextResponse.json(
            {success:false,message :"Internal server error"},
            {status:500},
        );
    }
}
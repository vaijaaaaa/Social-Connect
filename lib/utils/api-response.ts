import { NextResponse } from "next/server";

type SuccessPayload<T> = {
  success: true;
  message?: string;
  data?: T;
};

type ErrorPayload = {
  success: false;
  message: string;
  errors?: unknown;
};

export function ok<T>(payload: SuccessPayload<T>, status = 200) {
  return NextResponse.json(payload, { status });
}

export function fail(message: string, status = 400, errors?: unknown) {
  const payload: ErrorPayload = {
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  };

  return NextResponse.json(payload, { status });
}
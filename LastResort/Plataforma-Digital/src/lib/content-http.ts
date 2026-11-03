import { ContentError } from "@/lib/professor";

export function contentErrorResponse(error: unknown) {
  if (error instanceof ContentError) return Response.json({ message: error.message, errors: error.errors }, { status: error.status });
  console.error(error);
  return Response.json({ message: "Não foi possível concluir a operação. Tente novamente." }, { status: 500 });
}
export async function readContentForm(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return null;
  const file = form.get("file");
  return { form, input: { title: form.get("title"), description: form.get("description"), published: form.get("published"), kind: form.get("kind"), url: form.get("url"), file: file instanceof File && file.size > 0 ? file : null } };
}

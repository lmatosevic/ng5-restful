export class GenericResponse {
    success: boolean;
    description: string;
    data: Map<string, string> = new Map();
}

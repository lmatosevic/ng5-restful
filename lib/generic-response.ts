import {Serializable} from './serializable';

export class GenericResponse implements Serializable {
    success: boolean;
    description: string;
    data: Map<string, string> = new Map();

    serialize(): string {
        return JSON.stringify(this);
    }
}

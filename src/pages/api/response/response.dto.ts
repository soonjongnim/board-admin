import ResponseCode from "@/types/enum/reponse-code.enum";

export default interface ResponseDto {
    code: ResponseCode;
    message: string;
}
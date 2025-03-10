export default interface IThumbnail {
	name: string; // 파일명
  	size: number; // 파일 크기 (byte 단위)
  	type: string; // MIME 타입 (예: "image/jpeg")
  	lastModified: number; // 마지막 수정 날짜 (timestamp)
	url: string;
}
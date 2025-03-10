export default interface PatchItemRequestDto {
    itemId: number;
	itemName: string;
	price: number;
	stockNumber: number;
	itemDetail: string | null;
	itemSellStatus: string;
	imageUrlList: string[];
	thumbnailUrlList: string[];
	// regTime: string;
	// updateTime: string;
	// writerEmail: string;
};
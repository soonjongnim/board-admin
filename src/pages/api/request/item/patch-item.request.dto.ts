export default interface PatchItemRequestDto {
    itemId: number;
	itemName: string;
	price: number;
	stockNumber: number;
	itemDetail: string | null;
	itemSellStatus: string;
	imageUrlList: string[];
	// regTime: string;
	// updateTime: string;
	// writerEmail: string;
};
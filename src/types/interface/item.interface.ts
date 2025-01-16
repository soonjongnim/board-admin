export default interface Item {
    itemId: number;
	itemName: string;
	price: number;
	stockNumber: number;
	itemDetail: string | null;
	itemSellStatus: string;
	regTime: string;
	updateTime: string;
	writerEmail: string;
	imageUrlList: string[];
}
export default interface GetSearchItemRequestDto {
	itemSellStatus: string;
	searchBy: string;
	searchQuery: string;
	// itemIds: string[];
	startDate: string;
	endDate: string;
}
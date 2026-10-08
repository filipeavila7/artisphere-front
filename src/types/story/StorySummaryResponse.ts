import type { StoryType } from "./StoryType";

export interface StorySummaryResponse {
    id: number;
    imageUrl: string;
    storyType: StoryType;
    description: string;
}
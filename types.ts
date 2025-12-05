export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingOptions {
  style: 'isometric' | 'top-down' | 'artistic';
  colorScheme: 'vibrant' | 'pastel' | 'blueprint';
}

export interface GeneratedResult {
  imageUrl: string;
  description: string;
}

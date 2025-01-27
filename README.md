# Video Upload and Processing Service

## Overview

This service allows users to upload video files, process them, and retrieve signed URLs for playback.

## Assumptions and Choices

### Assumptions

- **Video file format**: The system assumes that the uploaded video files are in MP4 or AVI format.
  - Explanation: As these are widely used video formats.

### Choices

- **Programming language**: The system chooses to use TypeScript as the programming language for development.
  - Explanation: TypeScript is a popular and widely-used language, with a large community and extensive libraries for building scalable and maintainable applications.
- **Database**: The system chooses to use Sequelize as the database ORM.
  - Explanation: Sequelize is a popular and widely-used ORM, with a large community and extensive support for various databases.
- **Video processing**: The system chooses to use Fluent-FFmpeg for video processing.
  - Explanation: Fluent-FFmpeg is a popular and widely-used library for video processing, with a large community and extensive support for various video formats.

## Prerequisites

- FFmpeg library installed on your system [1]
- Node.js (latest version) installed on your system [2]
- npm (Node Package Manager) installed on your system

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm run start`
4. Postman [collection](https://www.postman.com/pranayreddy604/workspace/video-api/collection/41276459-fe5e95da-914e-45c2-912d-4e625ca447c6?action=share&creator=41276459)
5. For test coverage: `npm run test:coverage`

## References

[1] FFmpeg: A free and open-source multimedia processing library. https://ffmpeg.org/
[2] Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine. https://nodejs.org/
[3] Fluent-FFmpeg: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
[4] Sequelize: https://sequelize.org/

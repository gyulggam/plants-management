import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const HISTORY_DIR = path.join(process.cwd(), "data", "history");

// 변경 이력 파일이 없으면 생성
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

export async function GET() {
  try {
    // 변경 이력 파일 목록 가져오기
    const files = fs.readdirSync(HISTORY_DIR);

    // 파일들을 최신순으로 정렬
    const sortedFiles = files.sort((a, b) => {
      const aTime = fs.statSync(path.join(HISTORY_DIR, a)).mtime.getTime();
      const bTime = fs.statSync(path.join(HISTORY_DIR, b)).mtime.getTime();
      return bTime - aTime;
    });

    // 최근 50개의 변경 이력만 가져오기
    const recentFiles = sortedFiles.slice(0, 50);

    // 각 파일의 내용을 읽어서 변경 이력 배열 생성
    const histories = recentFiles.map((file) => {
      const filePath = path.join(HISTORY_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    });

    return NextResponse.json(histories);
  } catch (error) {
    console.error("변경 이력 조회 실패:", error);
    return NextResponse.json(
      { error: "변경 이력 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const history = await request.json();
    const id = uuidv4();

    // 변경 이력 저장
    const historyData = {
      ...history,
      id,
      createdAt: new Date().toISOString(),
    };

    const filePath = path.join(HISTORY_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(historyData, null, 2));

    return NextResponse.json(historyData);
  } catch (error) {
    console.error("변경 이력 저장 실패:", error);
    return NextResponse.json(
      { error: "변경 이력 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}

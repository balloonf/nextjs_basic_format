"use client";

import React from "react";
import { CalendarDays, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// 샘플 히스토리 데이터
const historyData = [
  {
    id: 1,
    title: "이미지 분석 프로젝트",
    date: "2025-05-01",
    time: "14:30"
  },
  {
    id: 2,
    title: "데이터 마이닝 작업",
    date: "2025-04-28",
    time: "10:15"
  },
  {
    id: 3,
    title: "사용자 인터페이스 설계",
    date: "2025-04-25",
    time: "16:45"
  },
  {
    id: 4,
    title: "API 연동 테스트",
    date: "2025-04-22",
    time: "09:30"
  },
  {
    id: 5,
    title: "서버 배포 작업",
    date: "2025-04-20",
    time: "11:20"
  }
];

export function History() {
  return (
    <div className="flex flex-col w-full h-full p-4">
      <h2 className="text-2xl font-bold mb-4">History</h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="히스토리 검색..."
          className="pl-8"
        />
      </div>
      
      <div className="space-y-4">
        {historyData.map((item) => (
          <div 
            key={item.id} 
            className="p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <h3 className="font-medium mb-2">{item.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span className="mr-3">{item.date}</span>
              <Clock className="h-4 w-4 mr-1" />
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

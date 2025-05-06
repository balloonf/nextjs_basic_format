"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { History } from '@/components/history';

// sample 페이지 컴포넌트를 동적으로 불러오기
const SamplePage = dynamic(() => import('@/app/sample/page'), { 
  loading: () => <div>로딩중...</div>,
  ssr: false
});

// 동적 컴포넌트 로딩을 위한 매핑 객체
const componentMap: Record<string, React.ComponentType> = {
  // Playground 하위 메뉴
  "history": History,
  "sample": SamplePage,
  // 다른 컴포넌트들은 필요에 따라 추가
};

// URL 경로에 따라 컴포넌트를 로드하는 함수
export function loadComponentByUrl(url: string): React.ReactNode {
  // '#' 문자 또는 URL의 시작 부분 제거
  const cleanUrl = url.replace(/^[/#]+/, '');
  
  // 빈 URL이나 존재하지 않는 경로의 경우 기본 컴포넌트 반환
  if (!cleanUrl || !componentMap[cleanUrl]) {
    return (
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">
          {cleanUrl ? `${cleanUrl} 페이지` : '홈 페이지'}
        </h2>
        <p className="text-muted-foreground">
          이 페이지는 개발 중입니다.
        </p>
      </div>
    );
  }

  // URL에 해당하는 컴포넌트 로드
  const Component = componentMap[cleanUrl];
  return <Component />;
}

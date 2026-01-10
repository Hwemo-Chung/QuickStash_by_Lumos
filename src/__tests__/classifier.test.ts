import { describe, it, expect } from 'vitest';
import { classify } from '../lib/classifier';

describe('classify', () => {
  describe('contacts drawer', () => {
    it('should classify Korean phone number to contacts', () => {
      expect(classify('010-1234-5678')).toBe('contacts');
    });

    it('should classify international phone number to contacts', () => {
      expect(classify('+82-10-1234-5678')).toBe('contacts');
    });

    it('should classify email address to contacts', () => {
      expect(classify('john@example.com')).toBe('contacts');
    });

    it('should classify email with text to contacts', () => {
      expect(classify('Contact me at john.doe@company.co.kr')).toBe('contacts');
    });
  });

  describe('money drawer', () => {
    it('should classify dollar amount to money', () => {
      expect(classify('$150.00')).toBe('money');
    });

    it('should classify won amount to money', () => {
      expect(classify('₩15,000')).toBe('money');
    });

    it('should classify Korean currency text to money', () => {
      expect(classify('이번 달 월급 350만원')).toBe('money');
    });

    it('should classify account number pattern to money', () => {
      expect(classify('계좌번호 110-123-456789')).toBe('money');
    });
  });

  describe('watch drawer', () => {
    it('should classify YouTube URL to watch', () => {
      expect(classify('https://youtube.com/watch?v=abc123')).toBe('watch');
    });

    it('should classify short YouTube URL to watch', () => {
      expect(classify('https://youtu.be/abc123')).toBe('watch');
    });

    it('should classify Vimeo URL to watch', () => {
      expect(classify('https://vimeo.com/123456')).toBe('watch');
    });

    it('should classify Twitch URL to watch', () => {
      expect(classify('https://twitch.tv/streamer')).toBe('watch');
    });
  });

  describe('dev drawer', () => {
    it('should classify GitHub URL to dev', () => {
      expect(classify('https://github.com/user/repo')).toBe('dev');
    });

    it('should classify code snippet to dev', () => {
      expect(classify('const foo = () => { return bar; }')).toBe('dev');
    });

    it('should classify function declaration to dev', () => {
      expect(classify('function handleClick(event) {')).toBe('dev');
    });

    it('should classify npm URL to dev', () => {
      expect(classify('https://npmjs.com/package/react')).toBe('dev');
    });
  });

  describe('read drawer', () => {
    it('should classify Medium URL to read', () => {
      expect(classify('https://medium.com/@user/article-title')).toBe('read');
    });

    it('should classify blog URL to read', () => {
      expect(classify('https://example.blog/post-title')).toBe('read');
    });

    it('should classify news URL to read', () => {
      expect(classify('https://news.example.com/article')).toBe('read');
    });
  });

  describe('schedule drawer', () => {
    it('should classify date format to schedule', () => {
      expect(classify('2024-03-15 미팅')).toBe('schedule');
    });

    it('should classify time format to schedule', () => {
      expect(classify('내일 14:30에 회의')).toBe('schedule');
    });

    it('should classify Korean weekday to schedule', () => {
      expect(classify('월요일 점심 약속')).toBe('schedule');
    });

    it('should classify meeting keyword to schedule', () => {
      expect(classify('Team meeting at 3pm')).toBe('schedule');
    });

    describe('Korean date formats', () => {
      it('should classify 월/일 format', () => {
        expect(classify('생일 1월 3일')).toBe('schedule');
      });

      it('should classify 월/일 without space', () => {
        expect(classify('12월25일 크리스마스')).toBe('schedule');
      });

      it('should classify birthday keyword', () => {
        expect(classify('엄마 생일')).toBe('schedule');
      });

      it('should classify 기념일', () => {
        expect(classify('결혼 기념일 준비')).toBe('schedule');
      });

      it('should classify relative dates - 내일', () => {
        expect(classify('내일 병원 예약')).toBe('schedule');
      });

      it('should classify relative dates - 다음주', () => {
        expect(classify('다음주 목요일 미팅')).toBe('schedule');
      });
    });

    describe('Japanese date formats', () => {
      it('should classify 月/日 format', () => {
        expect(classify('1月3日 誕生日')).toBe('schedule');
      });

      it('should classify Japanese weekday', () => {
        expect(classify('月曜日 会議')).toBe('schedule');
      });

      it('should classify 明日', () => {
        expect(classify('明日の予定')).toBe('schedule');
      });
    });

    describe('English date formats', () => {
      it('should classify Jan 3 format', () => {
        expect(classify('Birthday Jan 3')).toBe('schedule');
      });

      it('should classify January 3rd format', () => {
        expect(classify('Meeting January 3rd')).toBe('schedule');
      });

      it('should classify 3rd January format', () => {
        expect(classify('3rd January deadline')).toBe('schedule');
      });

      it('should classify tomorrow', () => {
        expect(classify('Call mom tomorrow')).toBe('schedule');
      });

      it('should classify next week', () => {
        expect(classify('Dentist next week')).toBe('schedule');
      });

      it('should classify birthday keyword', () => {
        expect(classify("Mom's birthday")).toBe('schedule');
      });
    });

    describe('Spanish date formats', () => {
      it('should classify de enero format', () => {
        expect(classify('Cumpleaños 3 de enero')).toBe('schedule');
      });

      it('should classify Spanish weekday', () => {
        expect(classify('Reunión el lunes')).toBe('schedule');
      });
    });
  });

  describe('recipes drawer', () => {
    it('should classify recipe URL to recipes', () => {
      expect(classify('https://recipes.com/pasta')).toBe('recipes');
    });

    it('should classify Korean recipe text to recipes', () => {
      expect(classify('김치찌개 레시피')).toBe('recipes');
    });

    it('should classify ingredient measurement to recipes', () => {
      expect(classify('밀가루 200g, 설탕 2큰술')).toBe('recipes');
    });

    describe('Korean recipe sites', () => {
      it('should classify 만개의레시피 URL', () => {
        expect(classify('https://www.10000recipe.com/recipe/7067653')).toBe('recipes');
      });

      it('should classify 네이버 쿠킹 URL', () => {
        expect(classify('https://cooking.naver.com/recipe/123')).toBe('recipes');
      });

      it('should classify 해먹남녀 URL', () => {
        expect(classify('https://haemukja.com/recipes/abc')).toBe('recipes');
      });
    });

    describe('international recipe sites', () => {
      it('should classify AllRecipes URL', () => {
        expect(classify('https://www.allrecipes.com/recipe/123/pasta')).toBe('recipes');
      });

      it('should classify Cookpad URL', () => {
        expect(classify('https://cookpad.com/recipe/123')).toBe('recipes');
      });

      it('should classify Cookpad Japan URL', () => {
        expect(classify('https://cookpad.jp/recipe/456')).toBe('recipes');
      });
    });

    describe('Korean cooking patterns', () => {
      it('should classify Korean dish suffix - 찌개', () => {
        expect(classify('된장찌개')).toBe('recipes');
      });

      it('should classify Korean dish suffix - 볶음', () => {
        expect(classify('제육볶음')).toBe('recipes');
      });

      it('should classify Korean cooking verb', () => {
        expect(classify('양파를 볶다가 간장을 넣고 졸이세요')).toBe('recipes');
      });

      it('should classify Korean measurements - 꼬집', () => {
        expect(classify('소금 2꼬집 넣어주세요')).toBe('recipes');
      });

      it('should classify Korean measurements - 인분', () => {
        expect(classify('4인분 기준 레시피입니다')).toBe('recipes');
      });
    });

    describe('Japanese cooking patterns', () => {
      it('should classify Japanese recipe keyword', () => {
        expect(classify('カレーライスのレシピ')).toBe('recipes');
      });

      it('should classify Japanese dish name', () => {
        expect(classify('親子丼の作り方')).toBe('recipes');
      });

      it('should classify Japanese measurements', () => {
        expect(classify('醤油 2大さじ、砂糖 1小さじ')).toBe('recipes');
      });

      it('should classify Japanese cooking verb', () => {
        expect(classify('野菜を炒める')).toBe('recipes');
      });
    });

    describe('Spanish cooking patterns', () => {
      it('should classify Spanish recipe keyword', () => {
        expect(classify('Receta de paella valenciana')).toBe('recipes');
      });

      it('should classify Spanish measurements', () => {
        expect(classify('2 cucharadas de aceite de oliva')).toBe('recipes');
      });

      it('should classify Spanish cooking verb', () => {
        expect(classify('Hervir el agua con sal')).toBe('recipes');
      });
    });

    describe('English cooking patterns', () => {
      it('should classify English cooking verb - sauté', () => {
        expect(classify('Sauté the onions until golden')).toBe('recipes');
      });

      it('should classify English cooking verb - simmer', () => {
        expect(classify('Let it simmer for 20 minutes')).toBe('recipes');
      });

      it('should classify prep time indicator', () => {
        expect(classify('Prep time: 15 min, Cook time: 30 min')).toBe('recipes');
      });

      it('should classify serving size', () => {
        expect(classify('This recipe serves 4 people')).toBe('recipes');
      });

      it('should classify food prep action', () => {
        expect(classify('Dice the tomatoes and julienne the carrots')).toBe('recipes');
      });
    });

    describe('measurements - international', () => {
      it('should classify oz measurement', () => {
        expect(classify('Add 8 oz of cream cheese')).toBe('recipes');
      });

      it('should classify cups measurement', () => {
        expect(classify('2 cups all-purpose flour')).toBe('recipes');
      });

      it('should classify tablespoon measurement', () => {
        expect(classify('1 tablespoon olive oil')).toBe('recipes');
      });
    });
  });

  describe('places drawer', () => {
    it('should classify Google Maps URL to places', () => {
      expect(classify('https://maps.google.com/place/123')).toBe('places');
    });

    it('should classify Korean address to places', () => {
      expect(classify('서울시 강남구 역삼동 123-45')).toBe('places');
    });

    it('should classify Naver Map URL to places', () => {
      expect(classify('https://map.naver.com/v5/place/123')).toBe('places');
    });
  });

  describe('shopping drawer', () => {
    it('should classify Amazon URL to shopping', () => {
      expect(classify('https://amazon.com/dp/B123456')).toBe('shopping');
    });

    it('should classify Coupang URL to shopping', () => {
      expect(classify('https://coupang.com/product/123')).toBe('shopping');
    });

    it('should classify product URL to shopping', () => {
      expect(classify('https://store.com/product/item-name')).toBe('shopping');
    });

    it('should classify Korean shopping keywords', () => {
      expect(classify('살것')).toBe('shopping');
      expect(classify('사야할 것들')).toBe('shopping');
      expect(classify('장바구니 추가')).toBe('shopping');
      expect(classify('쇼핑 목록')).toBe('shopping');
    });

    it('should classify Japanese shopping keywords', () => {
      expect(classify('買い物リスト')).toBe('shopping');
      expect(classify('購入予定')).toBe('shopping');
    });
  });

  describe('ideas vs notes (text length based fallback)', () => {
    it('should classify short text without patterns to ideas', () => {
      const shortText = 'Remember to call mom';
      expect(classify(shortText)).toBe('ideas');
    });

    it('should classify long text without patterns to notes', () => {
      const longText = 'This is a very long piece of text that contains more than one hundred characters. It should be classified as notes because it exceeds the threshold for short ideas and has no matching patterns.';
      expect(classify(longText)).toBe('notes');
    });

    it('should classify very short random text to ideas', () => {
      expect(classify('xyz123')).toBe('ideas');
    });
  });
});

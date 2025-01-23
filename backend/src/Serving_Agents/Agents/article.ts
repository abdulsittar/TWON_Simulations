import axios from 'axios';
import * as gnews from 'gnews';
import * as newspaper from 'newspaper'; // Assuming you have a similar library in Node.js
import { randomInt } from 'crypto';

type Language = 'en' | 'de' | 'nl' | 'sr' | 'it';
type Country = 'US' | 'DE' | 'NL' | 'RS' | 'IT';

export class Article {
  topic: string;
  n: number;
  language: Language;
  country: Country;
  url?: string;
  title?: string;
  summary?: string;

  constructor(topic: string, n = 10, language = 'en', country = 'US') {
    this.topic = topic;
    this.n = n;
    this.language = Article.mapLanguage(language);
    this.country = Article.mapCountry(country);

    const newsPage = this.retrieveNewsPage();
    const news = newsPage[randomInt(newsPage.length)];

    this.url = this.resolveRedirectUrl(news.url);

    const article = this.retrieveArticle();
    this.title = article.title;
    this.summary = article.summary.replace(/\n/g, ' ');
  }

  // Callable representation
  public toDict(): { url?: string; title?: string; summary?: string } {
    return {
      url: this.url,
      title: this.title,
      summary: this.summary,
    };
  }

  // String representation
  public toString(): string {
    return `Title: ${this.title}\nSummary: ${this.summary}`;
  }

  // Retrieve news page
  private retrieveNewsPage(): Array<{ url: string }> {
    return gnews.GNews({
      max_results: this.n,
      language: this.language,
      country: this.country,
    }).get_news(this.topic);
  }

  // Retrieve article
  private retrieveArticle(): { title: string; summary: string } {
    const article = new newspaper.Article(this.url!);
    article.download();
    article.parse();
    article.nlp();

    return {
      title: article.title,
      summary: article.summary,
    };
  }

  // Resolve URL redirection
  private async resolveRedirectUrl(url: string): Promise<string> {
    const response = await axios.get(url);
    return response.request.res.responseUrl;
  }

  // Map language string to enum
  private static mapLanguage(language: string): Language {
    const map: Record<string, Language> = {
      english: 'en',
      german: 'de',
      dutch: 'nl',
    };
    return map[language.toLowerCase()] || 'en';
  }

  // Map country string to enum
  private static mapCountry(country: string): Country {
    const map: Record<string, Country> = {
      english: 'US',
      german: 'DE',
      dutch: 'NL',
    };
    return map[country.toLowerCase()] || 'US';
  }
}

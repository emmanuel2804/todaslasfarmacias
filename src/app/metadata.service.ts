import { Inject, Injectable } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

export interface PageMetadata {
  title: string;
  imageRelativeUrl: string;
  description: string;
  author: string;
  keywords: string[];
  type: string;
}

const defaultMetadata: PageMetadata = {
  title: 'Todas las Farmacias',
  imageRelativeUrl: 'assets/images/android-chrome-512x512.png',
  description:
    'Busque en más de 100000 medicamentos de diferentes farmacias para encontrar los precios más baratos',
  author: 'Byt.bz',
  keywords: ['Farmacias', 'Mexico', 'medicamentos baratos'],
  type: 'website',
};

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  url = '';

  constructor(
    private metaTagService: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {
    this.url = this.document.URL;
  }

  public updateMetadata(
    metadata: Partial<PageMetadata>,
    index: boolean = true
  ): void {
    const pageMetadata: PageMetadata = { ...defaultMetadata, ...metadata };
    const metatags: MetaDefinition[] =
      this.generateMetaDefinitions(pageMetadata);

    this.metaTagService.addTags(
      [
        ...metatags,
        { property: 'og:url', content: `${this.url}${this.router.url}` },
        // { property: 'og:url', content: `${this.router.url}` },
        { name: 'robots', content: index ? 'index, follow' : 'noindex' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' },
      ],
      false
    );

    this.titleService.setTitle(pageMetadata.title);
  }

  private generateMetaDefinitions(metadata: PageMetadata): MetaDefinition[] {
    return [
      { name: 'title', content: metadata.title },
      { property: 'og:title', content: metadata.title },

      { name: 'description', content: metadata.description },
      { property: 'og:description', content: metadata.description },

      { name: 'author', content: metadata.author },
      { property: 'og:author', content: metadata.author },

      { name: 'keywords', content: metadata.keywords.join(', ') },

      { property: 'og:type', content: metadata.type },

      {
        property: 'og:image',
        content: `${this.url}${metadata.imageRelativeUrl}`,
        // content: `${metadata.imageRelativeUrl}`,
      },
    ];
  }
}

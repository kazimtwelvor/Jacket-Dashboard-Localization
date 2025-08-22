import type React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface RelatedArticlesProps {
  title: string
  articles: Array<{
    title: string
    link: string
    image?: string
  }>
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ title, articles }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <Link
            key={index}
            href={article.link}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex flex-col h-full">
              {article.image && (
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
              <div className="p-4 flex-grow">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {article.title}
                </h3>
                <div className="flex items-center text-blue-600 text-sm">
                  <span>Read more</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

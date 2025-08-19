import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Bookmark, Share, Search } from "lucide-react";

export default function CurrentAffairs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/articles"],
    retry: false,
  });

  const { data: featuredArticles, isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/articles/featured"],
    retry: false,
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const articleDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - articleDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredArticles = articles?.filter((article: any) => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Current Affairs</h1>
          <p className="text-gray-600 mb-6">Stay updated with the latest news and analysis relevant to your UPSC preparation</p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-articles"
            />
          </div>
        </div>

        {/* Featured Articles */}
        {!searchQuery && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Articles</h2>
            {featuredLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : featuredArticles && featuredArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {featuredArticles.slice(0, 2).map((article: any, index: number) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-featured-article-${index}`}>
                    {article.imageUrl && (
                      <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className="bg-secondary-500 text-white">FEATURED</Badge>
                        <Badge variant="outline">Current Affairs</Badge>
                        <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-featured-title-${index}`}>
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4" data-testid={`text-featured-summary-${index}`}>
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button size="sm" variant="ghost" data-testid={`button-bookmark-featured-${index}`}>
                            <Bookmark className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" data-testid={`button-share-featured-${index}`}>
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                        <Button className="bg-primary-600 hover:bg-primary-700" data-testid={`button-read-featured-${index}`}>
                          Read Full Article
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <CardContent>
                  <p className="text-gray-600">No featured articles available.</p>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Articles"}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article: any, index: number) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-article-${index}`}>
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover" />
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline">Current Affairs</Badge>
                      <span className="text-gray-500 text-xs">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2" data-testid={`text-article-title-${index}`}>
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-3" data-testid={`text-article-summary-${index}`}>
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="h-6 p-1" data-testid={`button-bookmark-article-${index}`}>
                          <Bookmark className="h-3 w-3" />
                        </Button>
                        <span className="text-gray-500 text-xs">{article.readTime} min read</span>
                      </div>
                      <Button size="sm" variant="link" className="text-primary-600 hover:text-primary-700 h-auto p-0" data-testid={`button-read-article-${index}`}>
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <p className="text-gray-600">
                  {searchQuery ? "No articles found matching your search." : "No articles available at the moment."}
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}

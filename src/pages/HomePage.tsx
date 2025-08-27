import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, Star, Users, Zap } from 'lucide-react';

export function HomePage() {
  const categories = [
    {
      name: 'Clothing',
      image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg',
      description: 'Elegant dresses, tops, and outfits for every occasion',
    },
    {
      name: 'Jewelry',
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg',
      description: 'Beautiful bangles, chains, earrings, and accessories',
    },
    {
      name: 'Beauty',
      image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg',
      description: 'Premium lipsticks, cosmetics, and beauty essentials',
    },
  ];

  const features = [
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: 'Quality Products',
      description: 'Handpicked fashion and accessories made from premium materials',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Fast WhatsApp Orders',
      description: 'Order your favorite items instantly through WhatsApp',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Personalized Service',
      description: 'Get personal styling advice and size recommendations',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Customer Satisfaction',
      description: '500+ happy customers who love our collection',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Welcome to Bella Boutique
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Discover exquisite fashion and accessories crafted for the modern woman. 
              From elegant clothing to stunning jewelry and beauty essentials - your perfect style awaits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog">
                <Button size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5" />
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Bella Boutique?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated collections of fashion, jewelry, and beauty products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              to={`/catalog?category=${encodeURIComponent(category.name)}`}
            >
              <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/catalog">
            <Button variant="outline" size="lg">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Bella Boutique?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing you with the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Style?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our complete collection of fashion, jewelry, and beauty products
          </p>
          <Link to="/catalog">
            <Button size="lg">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
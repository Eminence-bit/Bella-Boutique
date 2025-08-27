# Contributing to Bella Boutique

Thank you for your interest in contributing to Bella Boutique! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or request features
- Provide clear, detailed descriptions of the issue
- Include steps to reproduce the problem
- Mention your browser and operating system

### Suggesting Features

- Open a new issue with the "enhancement" label
- Describe the feature and its benefits
- Consider the impact on existing functionality

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/bella-boutique.git
cd bella-boutique

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces

### Styling

- Use TailwindCSS utility classes
- Follow the existing design system
- Ensure responsive design

### File Naming

- Use PascalCase for components: `ProductCard.tsx`
- Use camelCase for utilities: `formatPrice.ts`
- Use kebab-case for CSS files: `product-card.css`

## 🧪 Testing

### Before Submitting

- Test your changes in multiple browsers
- Ensure responsive design works on mobile
- Check for accessibility issues
- Verify all existing functionality still works

### Testing Checklist

- [ ] Code compiles without errors
- [ ] All tests pass (if applicable)
- [ ] UI looks correct on different screen sizes
- [ ] No console errors in browser
- [ ] Accessibility standards are met

## 📋 Pull Request Guidelines

### PR Title

Use a clear, descriptive title that explains the change:

- `Add product search functionality`
- `Fix mobile navigation bug`
- `Update product card design`

### PR Description

Include:

- Summary of changes
- Screenshots (for UI changes)
- Testing steps
- Related issues

### Code Review

- Address all review comments
- Keep commits focused and logical
- Squash commits if requested

## 🏷️ Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed

## 📚 Resources

### Documentation

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Tools

- [Vite](https://vitejs.dev/) - Build tool
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

## 🆘 Getting Help

If you need help:

1. Check existing issues and discussions
2. Ask questions in the issue tracker
3. Join our community discussions

## 📄 License

By contributing to Bella Boutique, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Bella Boutique! 🎉

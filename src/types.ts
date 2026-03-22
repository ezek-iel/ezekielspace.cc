 interface PostFrontmatter  {
    title: string
    author: string
    date: string
    tags: string[]
    layout: string
    description: string
    pinned: boolean;
}

export interface Post {
    frontmatter: PostFrontmatter
    url: string
}
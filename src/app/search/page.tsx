import { getAllPosts } from "@/lib/posts"
import { SearchClient } from "./SearchClient"

export default function SearchPage() {
  const posts = getAllPosts()
  return <SearchClient posts={posts} />
}

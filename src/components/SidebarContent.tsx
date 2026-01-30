import { SidebarNav } from "@/components/SidebarNav"
import { ProfileCard } from "@/components/ProfileCard"
import { getAllPosts, getAllTags } from "@/lib/posts"

export function SidebarContent() {
  const posts = getAllPosts()
  const tags = getAllTags()

  return (
    <div className="grid gap-6">
      <SidebarNav />
      <ProfileCard postCount={posts.length} tagCount={tags.length} />
    </div>
  )
}

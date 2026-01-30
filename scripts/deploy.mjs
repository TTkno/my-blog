import { spawnSync } from "child_process"

function run(cmd, args, label) {
  console.log(`\n▶ ${label}\n$ ${cmd} ${args.join(" ")}`)
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true })
  return r.status === 0
}

const fast = process.argv.includes("--fast")
const dry = process.argv.includes("--dry")

if (!fast) {
  const okLint = run("npm", ["run", "lint"], dry ? "Step 1/2: ESLint 检查（dry-run）" : "Step 1/3: ESLint 检查")
  if (!okLint) {
    console.error(
      "\n❌ Lint 未通过：已停止。\n（dry-run 不会部署；deploy 也不会上线）\n请先修复 lint 错误再继续。\n"
    )
    process.exit(1)
  }
} else {
  console.log("\n⚡ Fast mode：跳过 ESLint")
}

const okBuild = run(
  "npm",
  ["run", "build"],
  dry
    ? (fast ? "Step 1/1: Next.js Build（dry-run）" : "Step 2/2: Next.js Build（dry-run）")
    : (fast ? "Step 1/2: Next.js Build（含类型检查）" : "Step 2/3: Next.js Build（含类型检查）")
)
if (!okBuild) {
  console.error(
    "\n❌ Build 未通过：已停止。\n（dry-run 不会部署；deploy 也不会上线）\n请先修复构建/类型错误再继续。\n"
  )
  process.exit(1)
}

if (dry) {
  console.log("\n✅ Dry run 完成：检查通过（未部署）。\n")
  process.exit(0)
}

const okDeploy = run(
  "npx",
  ["vercel", "--prod"],
  fast ? "Step 2/2: 部署到 Vercel Production" : "Step 3/3: 部署到 Vercel Production"
)
if (!okDeploy) {
  console.error(
    "\n❌ 部署失败：本次没有完成上线。\n请检查网络/登录状态后再执行部署。\n"
  )
  process.exit(1)
}

console.log("\n✅ 发布成功：已上线到 Vercel Production。\n")

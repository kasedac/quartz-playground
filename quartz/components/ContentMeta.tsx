import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { formatDate } from "./Date"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"
import readingTime from "reading-time"

interface ContentMetaOptions {
  showReadingTime: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
}

export default ((userOpts?: Partial<ContentMetaOptions>) => {
  const opts = { ...defaultOptions, ...userOpts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text
    if (text) {
      const segments: string[] = []
      const fm = fileData.frontmatter

      // 1. 投稿日 (Hugo-style priority)
      // published > date > created > system creation date
      const createdRaw = fm?.published ?? fm?.date ?? fm?.created ?? fileData.dates?.created
      const createdDate = createdRaw ? new globalThis.Date(createdRaw) : undefined
      const isCreatedValid = createdDate && !isNaN(createdDate.getTime())

      // 2. 更新日 (Hugo-style priority)
      // updated > lastmod > (createdRaw) > system modified date
      const modifiedRaw = fm?.updated ?? fm?.lastmod ?? createdRaw ?? fileData.dates?.modified
      const modifiedDate = modifiedRaw ? new globalThis.Date(modifiedRaw) : undefined
      const isModifiedValid = modifiedDate && !isNaN(modifiedDate.getTime())

      // 投稿日の追加
      if (isCreatedValid) {
        segments.push(`投稿日: ${formatDate(createdDate, cfg.locale)}`)
      }

      // 更新日の追加 (投稿日より新しい場合のみ表示)
      if (isModifiedValid && isCreatedValid) {
        if (modifiedDate.getTime() > createdDate.getTime()) {
          segments.push(`更新日: ${formatDate(modifiedDate, cfg.locale)}`)
        }
      }

      // 読了時間の追加
      if (opts.showReadingTime) {
        const readingTimeMsg = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(readingTime(text).minutes),
        })
        segments.push(readingTimeMsg)
      }

      return (
        <p class={classNames(displayClass, "content-meta")}>
          {segments.join(" , ")}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = `
  .content-meta {
    margin-top: 0;
    color: var(--gray);
  }
  `

  return ContentMetadata
}) satisfies QuartzComponentConstructor
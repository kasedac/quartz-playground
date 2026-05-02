import { Date, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default (() => {
  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text
    if (text) {
      const segments: string[] = []
      const fm = fileData.frontmatter // フロントマターへのショートカット

      // 1. 投稿日 (Created/Published Date) の判定ロジック
      // 優先順位: published > date > created > システム作成日
      const createdRaw = fm?.published ?? fm?.date ?? fm?.created ?? fileData.dates?.created
      const createdDate = createdRaw ? new Date(createdRaw) : undefined

      // 2. 更新日 (Modified Date) の判定ロジック
      // 優先順位: updated > lastmod > (投稿日) > システム更新日
      const modifiedRaw = fm?.updated ?? fm?.lastmod ?? createdRaw ?? fileData.dates?.modified
      const modifiedDate = modifiedRaw ? new Date(modifiedRaw) : undefined

      // 表示セグメントの構築
      if (createdDate && !isNaN(createdDate.getTime())) {
        segments.push(`投稿日: ${formatDate(createdDate, cfg.locale)}`)
      }

      // 更新日が存在し、かつ投稿日よりも新しい（または異なる）場合のみ表示
      if (
        modifiedDate && 
        !isNaN(modifiedDate.getTime()) &&
        createdDate &&
        modifiedDate.getTime() > createdDate.getTime()
      ) {
        segments.push(`更新日: ${formatDate(modifiedDate, cfg.locale)}`)
      }

      // 読了時間などの他のメタデータ
      const { minutes, words: _words } = i18n(cfg.locale).components.contentMeta.readingTime({
        minutes: Math.ceil(readingTime(text).minutes),
      })
      segments.push(minutes)

      return (
        <p class={classNames(displayClass, "content-meta")}>
          {segments.join(" / ")}
        </p>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor

export default function ViewHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-col justify-between gap-5 pb-1 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-white sm:text-[36px]">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-fog">
          {description}
        </p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  )
}

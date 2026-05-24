export default function PathDetailPage({ params }: { params: { slug: string } }) {
  return <main className="mx-auto max-w-4xl p-6 text-2xl font-bold">{params.slug}</main>;
}

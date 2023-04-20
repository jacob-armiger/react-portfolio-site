export default function Card() {
  return (
    <div className="flex flex-col rounded-lg border border-b-4 border-black md:w-8/12 md:flex-row md:h-52">
      <img
        className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
        src="/comic_list.png"
        alt=""
      />
      <div className="flex flex-col justify-start p-6">
        <h5 className="mb-2 text-xl font-medium">Card title</h5>
        <p className="mb-4 text-base">
          This is a wider card with supporting text below as a natural lead-in
          to additional content. This content is a little bit longer.
        </p>
        <p className="text-xs">Last updated 3 mins ago</p>
      </div>
    </div>
  );
}

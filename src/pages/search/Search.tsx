import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { search } from "../../service/search/SearchService";

function Search() {
    const [searchParams] = useSearchParams();

    const query = searchParams.get("q") || "";

    const {
        data,
        isLoading,
        isError
    } = useQuery({
        queryKey: ["search", query],
        queryFn: () => search(query),
        enabled: !!query.trim()
    });

    const profiles = data?.profiles.content ?? [];
    const posts = data?.posts.content ?? [];

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Something went wrong.</div>;
    }

    return (
        <main>
            <h1>Search results for "{query}"</h1>

            {profiles.length > 0 && (
                <section>
                    <h2>Artists</h2>

                    {profiles.map((profile) => (
                        <div key={profile.userId}>
                            <p>{profile.name}</p>
                            <p>@{profile.userName}</p>
                        </div>
                    ))}
                </section>
            )}

            {posts.length > 0 && (
                <section>
                    <h2>Artworks</h2>

                    {posts.map((post) => (
                        <div key={post.id}>
                            <p>{post.title}</p>
                        </div>
                    ))}
                </section>
            )}

            {profiles.length === 0 && posts.length === 0 && (
                <p>No results found.</p>
            )}
        </main>
    );
}

export default Search;
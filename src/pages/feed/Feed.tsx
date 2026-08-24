import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeed } from "../../service/post/PostService";

const PAGE_SIZE = 12; // tanto de post que vem por pagina

function Feed() {
    // Quando o usuário chegar perto desse elemento
    // significa que ele está chegando no final do feed
    // carregar próxima página
    const sentinelRef = useRef<HTMLDivElement>(null);


    // biblioteca nova, responsavel por fazer tudo, como guardar as páginas,
    // saber qual página está sendo carregada, fazer a requisição, armazenar os resultados
    // buscar a próxima página, controlar loading, cache, evitar algumas requisições duplicadas
    const {
        data, // É onde ficam os dados retornados pelas páginas.
        isLoading, // carregamento
        isError, // erro
        fetchNextPage, // carregar próxima página
        hasNextPage, // verifica se ainda existe outra pagina
        isFetchingNextPage, // Esta carregando a próxima página neste momento?
    } = useInfiniteQuery({
        queryKey: ["feed"], // Isso é o identificador dessa query no cache do React Query.
        initialPageParam: 0, // pagina inicial

        // fazer a requisição
        queryFn: ({ pageParam }) => getFeed(pageParam, PAGE_SIZE),  // começa com (0, 12)

        // pegar proxima pagina
        getNextPageParam: (lastPage) => {
            if (lastPage.last) { // se for a ultima, retorna undefined
                return undefined;
            }
            return lastPage.number + 1; // se não for a ultima, aumenta mais 1
        },
    });

    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem(
                "feed-scroll",
                window.scrollY.toString()
            );
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);


    useEffect(() => {
        if (!data) return;

        const savedScroll = sessionStorage.getItem("feed-scroll");

        if (savedScroll) {
            window.scrollTo({
                top: Number(savedScroll),
                behavior: "instant"
            });
        }
    }, [data]);

    // useEffect com infinte scroll
    useEffect(() => {
        // pega a div
        const sentinel = sentinelRef.current;

        // para a execução se não existir
        if (!sentinel) return;

        // API nativa do navegador, detecta se um elemento esta visivel no navegador
        const observer = new IntersectionObserver(
            //  Se o sentinel entrou na área observada, existe próxima página
            //  e eu não estou carregando uma página agora → carregue a próxima.
            (entries) => {
                // entries[0].isIntersecting: O sentinel está aparecendo na área observada?
                // hasNextPage: Ainda tenho páginas?
                // !isFetchingNextPage : Não estou carregando outra página neste momento.
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            // O threshold: 0.1 significa que aproximadamente 10% do sentinel precisa estar intersectando para disparar a observação.
            { threshold: 0.1, rootMargin: "600px 0px" }
        );

        // ique observando esse elemento.
        observer.observe(sentinel);

        // Quando o componente for desmontado, você remove o observer.
        // Sem isso, poderia deixar observadores ativos desnecessariamente.
        return () => observer.disconnect();

        // O useEffect será recriado caso algum desses valores/funções relevantes mude.
        // Isso garante que o observer esteja trabalhando com os valores atuais.
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // caso esteja carregando
    if (isLoading) {
        return <p>Carregando feed...</p>;
    }

    // caso tenha erro
    if (isError) {
        return <p>Erro ao carregar o feed.</p>;
    }

    // flatMap para percorrer as os conteudos dentor das paginas e não so as paginas
    // ?? []: Se data?.pages.flatMap(...) for null ou undefined, use uma lista vazia.
    const posts = data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main>
            <h1>Feed</h1>

            {
                // renderiza os posts
            }
            {posts.map((post) => (
                <article key={post.id}>
                    <p>{post.title}</p>
                    <p>{post.id}</p>
                    <span>{post.likedByMe ? "❤️" : "🤍"} {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                </article>
            ))}

            {
                // sentinela para saber quando chegou no final
            }
            <div ref={sentinelRef} style={{ height: "10px" }} />

            {
                // caso esteja buscando novas paginas mostra o p
            }
            {isFetchingNextPage && <p>Carregando mais...</p>}
        </main>
    );
}

export default Feed;
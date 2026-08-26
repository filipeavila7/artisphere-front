import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Masonry from "react-masonry-css";
import { getFeed } from "../../service/post/PostService";
import PostCard from "../../components/feed/PostCard";

import "../../styles/feed.css"
import { PostCardSkeleton } from "../../components/feed/PostCardSkeleton";

const PAGE_SIZE = 12; // quantidade de posts por pagina

// breakpoints -> quantidade de colunas
// substitui os @media do CSS antigo
const breakpointColumns = {
    default: 5, // começa com 4 colunas
    1200: 4, // com 1200 -> 4 colunas
    900: 3, // 900 -> 3
    640: 2, //...
};

function Feed() {
    // sentinel para ficar no final e souber quando deve buscar mais posts
    const sentinelRef = useRef<HTMLDivElement>(null);

    const {
        data, // onde fica as paginas carregadas
        isLoading, // carregando
        isError, // erro
        fetchNextPage, // pegar proxima pagina
        hasNextPage, // tem proxima pagina?
        isFetchingNextPage, // ta pegando proxima pagina?
    } = useInfiniteQuery({
        queryKey: ["feed"],  // identificador dessa consulta no cache do React Query
        initialPageParam: 0, // pagina inicial
        // getFeed(0, 12)
        queryFn: ({ pageParam }) => getFeed(pageParam, PAGE_SIZE), // usa a funçao de buscar post começando da pagina 0
        getNextPageParam: (lastPage) => { // pegar proxiuma pagina
            if (lastPage.last) {
                return undefined; // se for a ultima retorna undefined
            }
            return lastPage.number + 1; // se não for, aumenta em mais 1
        },
    });

    // restauração de scroll
    const restoredScroll = useRef(false);
    // guardar a posição do usuario
    const scrollPosition = useRef(0);

    // useEfect para salvar o scroll
    useEffect(() => { 
        const handleScroll = () => {
            scrollPosition.current = window.scrollY; // pegar scroll quando o usuario rolar
        };

        window.addEventListener("scroll", handleScroll); // mavegador chama a função sempre que houve scrol
        
        // é executada quando o componente é desmontado.
        return () => {
            // salva a posição antes de desmontar
            sessionStorage.setItem(
                "feed-scroll", 
                String(scrollPosition.current)
            );
            // evita deixar o listener ativo depois que o Feed sumiu.
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    //useEfect para restaurar o scroll
    useEffect(() => {
        // caso não tenha posts ou ja restaurou uma vez, não faz nada
        if (!data || restoredScroll.current) return;

        const savedScroll = sessionStorage.getItem("feed-scroll"); // pega a posição salva
        
        // se não tiver, não tem nada pra restaurar e não faz nada
        if (!savedScroll) {
            restoredScroll.current = true;
            return;
        }

        // transforma em numero
        const target = Number(savedScroll);

        // descobrindo até onde podemos rolar
        const maxScrollAvailable =
            document.documentElement.scrollHeight - window.innerHeight;
        
            // podemos chegar na posição salva?
        const canReachTarget = maxScrollAvailable >= target;

        if (!canReachTarget && hasNextPage) {
            return;
        }

        restoredScroll.current = true; // restaura 

        requestAnimationFrame(() => { // move o usuario para o local
            window.scrollTo({
                top: target,
                behavior: "instant",
            });
        });
    }, [data, hasNextPage]);


    // responsável por buscar novas páginas:
    useEffect(() => {
        // pega o sentinel
        const sentinel = sentinelRef.current;
        
        // caso não exista, retorna
        if (!sentinel) return;

        // "Esse elemento entrou na tela?
        const observer = new IntersectionObserver(
            // sentinel apareceu, tem outra pagina, e não esta carregando outra
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage(); // pega a proxima
                }
            },
            { threshold: 0.1, rootMargin: "600px 0px" } // Considere o sentinel como alcançado 600px antes dele realmente chegar na tela
        );
        
        // "Observer, começa a observar esse elemento.
        observer.observe(sentinel);
        
        // Quando o efeito for recriado ou o componente desmontar, remove o observer anterior.
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


    // caso der erro
    if (isError) {
        return <p>Erro ao carregar o feed.</p>;
    }

    // pega os posts dentro da pagina de posts
    const posts = data?.pages.flatMap((page) => page.content) ?? [];

    return (
        <main className="feed-lay">
        

            <Masonry // lib para masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid_column"
            >
                {isLoading &&
                // cria 10
                    Array.from({ length: 10 }).map((_, index) => (
                        <PostCardSkeleton key={`initial-${index}`} />
                    ))
                }

                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                    />
                ))}

                
                {isFetchingNextPage &&
                // skeleton de quando ta pegando proxima pagina
                    Array.from({ length: 5 }).map((_, index) => (
                        <PostCardSkeleton key={`next-${index}`} />
                    ))
                }
            </Masonry>

            <div ref={sentinelRef} style={{ height: "10px" }} />
        </main>
    );
}

export default Feed;
//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:api_client_dart/src/model/route_list_response_dto_output_items_inner.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'route_list_response_dto_output.g.dart';

/// RouteListResponseDtoOutput
///
/// Properties:
/// * [items] 
/// * [nextCursor] 
@BuiltValue()
abstract class RouteListResponseDtoOutput implements Built<RouteListResponseDtoOutput, RouteListResponseDtoOutputBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<RouteListResponseDtoOutputItemsInner> get items;

  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  RouteListResponseDtoOutput._();

  factory RouteListResponseDtoOutput([void updates(RouteListResponseDtoOutputBuilder b)]) = _$RouteListResponseDtoOutput;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RouteListResponseDtoOutputBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RouteListResponseDtoOutput> get serializer => _$RouteListResponseDtoOutputSerializer();
}

class _$RouteListResponseDtoOutputSerializer implements PrimitiveSerializer<RouteListResponseDtoOutput> {
  @override
  final Iterable<Type> types = const [RouteListResponseDtoOutput, _$RouteListResponseDtoOutput];

  @override
  final String wireName = r'RouteListResponseDtoOutput';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RouteListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(RouteListResponseDtoOutputItemsInner)]),
    );
    yield r'nextCursor';
    yield object.nextCursor == null ? null : serializers.serialize(
      object.nextCursor,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RouteListResponseDtoOutput object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RouteListResponseDtoOutputBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(RouteListResponseDtoOutputItemsInner)]),
          ) as BuiltList<RouteListResponseDtoOutputItemsInner>;
          result.items.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.nextCursor = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RouteListResponseDtoOutput deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RouteListResponseDtoOutputBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}



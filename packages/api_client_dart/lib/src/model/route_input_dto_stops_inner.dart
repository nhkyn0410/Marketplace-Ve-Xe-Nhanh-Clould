//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'route_input_dto_stops_inner.g.dart';

/// RouteInputDtoStopsInner
///
/// Properties:
/// * [catalogStopPointId] 
/// * [stopPointId] 
/// * [note] 
@BuiltValue()
abstract class RouteInputDtoStopsInner implements Built<RouteInputDtoStopsInner, RouteInputDtoStopsInnerBuilder> {
  @BuiltValueField(wireName: r'catalogStopPointId')
  String? get catalogStopPointId;

  @BuiltValueField(wireName: r'stopPointId')
  String? get stopPointId;

  @BuiltValueField(wireName: r'note')
  String? get note;

  RouteInputDtoStopsInner._();

  factory RouteInputDtoStopsInner([void updates(RouteInputDtoStopsInnerBuilder b)]) = _$RouteInputDtoStopsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RouteInputDtoStopsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RouteInputDtoStopsInner> get serializer => _$RouteInputDtoStopsInnerSerializer();
}

class _$RouteInputDtoStopsInnerSerializer implements PrimitiveSerializer<RouteInputDtoStopsInner> {
  @override
  final Iterable<Type> types = const [RouteInputDtoStopsInner, _$RouteInputDtoStopsInner];

  @override
  final String wireName = r'RouteInputDtoStopsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RouteInputDtoStopsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'catalogStopPointId';
    yield object.catalogStopPointId == null ? null : serializers.serialize(
      object.catalogStopPointId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'stopPointId';
    yield object.stopPointId == null ? null : serializers.serialize(
      object.stopPointId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RouteInputDtoStopsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RouteInputDtoStopsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'catalogStopPointId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.catalogStopPointId = valueDes;
          break;
        case r'stopPointId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.stopPointId = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RouteInputDtoStopsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RouteInputDtoStopsInnerBuilder();
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



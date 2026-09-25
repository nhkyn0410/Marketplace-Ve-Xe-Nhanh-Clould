//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:api_client_dart/src/model/route_input_dto_stops_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'route_input_dto.g.dart';

/// RouteInputDto
///
/// Properties:
/// * [name] 
/// * [status] 
/// * [note] 
/// * [stops] 
@BuiltValue()
abstract class RouteInputDto implements Built<RouteInputDto, RouteInputDtoBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'status')
  RouteInputDtoStatusEnum get status;
  // enum statusEnum {  ACTIVE,  INACTIVE,  };

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'stops')
  BuiltList<RouteInputDtoStopsInner> get stops;

  RouteInputDto._();

  factory RouteInputDto([void updates(RouteInputDtoBuilder b)]) = _$RouteInputDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RouteInputDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RouteInputDto> get serializer => _$RouteInputDtoSerializer();
}

class _$RouteInputDtoSerializer implements PrimitiveSerializer<RouteInputDto> {
  @override
  final Iterable<Type> types = const [RouteInputDto, _$RouteInputDto];

  @override
  final String wireName = r'RouteInputDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RouteInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(RouteInputDtoStatusEnum),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'stops';
    yield serializers.serialize(
      object.stops,
      specifiedType: const FullType(BuiltList, [FullType(RouteInputDtoStopsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RouteInputDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RouteInputDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(RouteInputDtoStatusEnum),
          ) as RouteInputDtoStatusEnum;
          result.status = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'stops':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(RouteInputDtoStopsInner)]),
          ) as BuiltList<RouteInputDtoStopsInner>;
          result.stops.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RouteInputDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RouteInputDtoBuilder();
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


class RouteInputDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const RouteInputDtoStatusEnum ACTIVE = _$routeInputDtoStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const RouteInputDtoStatusEnum INACTIVE = _$routeInputDtoStatusEnum_INACTIVE;

  static Serializer<RouteInputDtoStatusEnum> get serializer => _$routeInputDtoStatusEnumSerializer;

  const RouteInputDtoStatusEnum._(String name): super(name);

  static BuiltSet<RouteInputDtoStatusEnum> get values => _$routeInputDtoStatusEnumValues;
  static RouteInputDtoStatusEnum valueOf(String name) => _$routeInputDtoStatusEnumValueOf(name);
}

